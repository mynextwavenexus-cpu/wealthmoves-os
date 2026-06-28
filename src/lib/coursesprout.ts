// CourseSprout API Integration
// Automatically enrolls WealthMoves OS users in the Dream Life Blueprint course

const COURSESPROUT_API_KEY = process.env.COURSESPROUT_API_KEY || "";
const COURSESPROUT_BASE_URL = "https://api.coursesprout.com/api/ai";
const DEFAULT_POD_ID = process.env.COURSESPROUT_POD_ID || "965";
const DEFAULT_PRICING_OPTION_ID = process.env.COURSESPROUT_PRICING_OPTION_ID || "1022";

export interface CourseSproutMember {
  id?: number;
  email: string;
  name?: string;
  pod_id: number;
  pricing_option_id: number;
  status?: string;
  created_at?: string;
}

export interface CourseSproutResponse {
  success: boolean;
  message: string;
  data?: CourseSproutMember | CourseSproutMember[];
}

/**
 * Enroll a user in CourseSprout pod
 * This is called automatically when a new user registers
 */
export async function enrollUserInCourse(
  email: string,
  name: string,
  podId: string = DEFAULT_POD_ID,
  pricingOptionId: string = DEFAULT_PRICING_OPTION_ID
): Promise<{ success: boolean; message: string; memberId?: number }> {
  // If no API key is configured, skip enrollment but don't fail
  if (!COURSESPROUT_API_KEY) {
    console.log("CourseSprout API key not configured, skipping enrollment");
    return { success: true, message: "Enrollment skipped - API not configured" };
  }

  try {
    // First, check if user already exists in the pod
    const existingMember = await findMemberByEmail(email, podId);
    
    if (existingMember) {
      console.log(`User ${email} already enrolled in pod ${podId}`);
      return { 
        success: true, 
        message: "User already enrolled", 
        memberId: existingMember.id 
      };
    }

    // Enroll the new member
    const response = await fetch(`${COURSESPROUT_BASE_URL}/add-member`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": COURSESPROUT_API_KEY,
      },
      body: JSON.stringify({
        email,
        name,
        pod_id: parseInt(podId),
        pricing_option_id: parseInt(pricingOptionId),
      }),
    });

    const data: CourseSproutResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to enroll user");
    }

    console.log(`Successfully enrolled ${email} in CourseSprout pod ${podId}`);
    
    return {
      success: true,
      message: "Successfully enrolled in course",
      memberId: (data.data as CourseSproutMember)?.id,
    };
  } catch (error) {
    console.error("CourseSprout enrollment error:", error);
    // Don't fail registration if enrollment fails
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Enrollment failed" 
    };
  }
}

/**
 * Find a member by email in a specific pod
 */
async function findMemberByEmail(
  email: string,
  podId: string
): Promise<CourseSproutMember | null> {
  try {
    const response = await fetch(
      `${COURSESPROUT_BASE_URL}/get-member-by-email/${encodeURIComponent(email)}`,
      {
        headers: {
          "X-API-KEY": COURSESPROUT_API_KEY,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data: CourseSproutResponse = await response.json();
    
    if (!data.success || !data.data) {
      return null;
    }

    // Filter by pod_id if multiple memberships exist
    const members = Array.isArray(data.data) ? data.data : [data.data];
    return members.find((m) => m.pod_id === parseInt(podId)) || null;
  } catch (error) {
    console.error("Error finding member:", error);
    return null;
  }
}

/**
 * Get all members in a pod (for admin purposes)
 */
export async function getPodMembers(podId: string = DEFAULT_POD_ID): Promise<CourseSproutMember[]> {
  if (!COURSESPROUT_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(`${COURSESPROUT_BASE_URL}/get-member/${podId}`, {
      headers: {
        "X-API-KEY": COURSESPROUT_API_KEY,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data: CourseSproutResponse = await response.json();
    
    if (!data.success || !data.data) {
      return [];
    }

    return Array.isArray(data.data) ? data.data : [data.data];
  } catch (error) {
    console.error("Error fetching pod members:", error);
    return [];
  }
}

/**
 * Send a reminder to a member (e.g., to complete the course)
 */
export async function sendMemberReminder(
  memberId: number,
  message?: string
): Promise<{ success: boolean; message: string }> {
  if (!COURSESPROUT_API_KEY) {
    return { success: false, message: "API not configured" };
  }

  try {
    const response = await fetch(`${COURSESPROUT_BASE_URL}/send-member-reminder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": COURSESPROUT_API_KEY,
      },
      body: JSON.stringify({
        member_id: memberId,
        message: message || "Don't forget to continue your Dream Life Blueprint course!",
      }),
    });

    const data: CourseSproutResponse = await response.json();

    return {
      success: data.success,
      message: data.message,
    };
  } catch (error) {
    console.error("Error sending reminder:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send reminder",
    };
  }
}

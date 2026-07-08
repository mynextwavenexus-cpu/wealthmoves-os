export default function SystemsPage() {
  const monthlyTarget = 10000;
  const revenuePerSystem = Math.round(monthlyTarget / 6);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Revenue Systems</h1>
      <p className="mb-6">Build systems to reach ${monthlyTarget.toLocaleString()}/mo</p>
      
      <div className="grid gap-4">
        {[
          { name: "Newsletter System", desc: "Build an audience and monetize" },
          { name: "Coaching System", desc: "1-on-1 or group coaching" },
          { name: "Course System", desc: "Create and sell courses" },
          { name: "Consulting System", desc: "High-ticket consulting" },
          { name: "Affiliate System", desc: "Promote and earn commissions" },
          { name: "Community System", desc: "Paid community" },
        ].map((system) => (
          <div key={system.name} className="border p-4 rounded-lg">
            <h3 className="text-xl font-semibold">{system.name}</h3>
            <p className="text-gray-600">{system.desc}</p>
            <p className="text-2xl font-bold mt-2">${revenuePerSystem.toLocaleString()}/mo</p>
          </div>
        ))}
      </div>
    </div>
  );
}

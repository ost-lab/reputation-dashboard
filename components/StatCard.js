export default function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[140px]">
      <div className={`p-3 rounded-full mb-3 ${color}`}>
        {icon}
      </div>
      <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}
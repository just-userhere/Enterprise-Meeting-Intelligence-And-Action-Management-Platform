import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardHeader } from '../components/UI.jsx';

export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-900">Profile</h1>
      <Card>
        <CardHeader title="Employee account" subtitle="Authenticated via JWT" />
        <dl className="space-y-2 px-5 py-4 text-sm">
          <div className="flex gap-2"><dt className="w-24 font-semibold text-slate-500">Name</dt><dd>{user?.name}</dd></div>
          <div className="flex gap-2"><dt className="w-24 font-semibold text-slate-500">Email</dt><dd>{user?.email}</dd></div>
          <div className="flex gap-2"><dt className="w-24 font-semibold text-slate-500">Role</dt><dd>{user?.role}</dd></div>
        </dl>
      </Card>
    </div>
  );
}

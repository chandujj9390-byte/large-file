import ClientDashboard from '@/components/ClientDashboard';

export const metadata = {
  title: 'Client Dashboard & Ledgers — ARNE Works',
  description: 'View your creative studio bookings, milestones, and download official receipts.',
};

export default function DashboardPage() {
  return <ClientDashboard loginRedirectUrl="/login" />;
}

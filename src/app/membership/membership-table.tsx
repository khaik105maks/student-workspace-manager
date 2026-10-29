import type { MembershipView } from "@/modules/membership/adapters/driving/http/check.type";

interface MembershipTableProps {
  readonly memberships: ReadonlyArray<MembershipView>;
}

export function MembershipTable({ memberships }: MembershipTableProps) {
  if (memberships.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead><tr className="border-b"><th className="p-3">Email</th><th className="p-3">Статус</th></tr></thead>
        <tbody>{memberships.map((membership) => <MembershipRow key={membership.email} membership={membership} />)}</tbody>
      </table>
    </div>
  );
}

function MembershipRow({ membership }: { readonly membership: MembershipView }) {
  return <tr className="border-b"><td className="p-3 font-mono">{membership.email}</td><td className="p-3">{membership.status}</td></tr>;
}

import { ACTION_TYPE_LABEL } from "@/lib/labels";
import type { RecommendedAction, Company } from "@prisma/client";

type ActionWithCompany = RecommendedAction & { company: Company | null };

export function RecommendedActionsList({ actions }: { actions: ActionWithCompany[] }) {
  return (
    <div>
      <h2 className="text-ink-500 text-label tracking-[0.06em] uppercase">Recommended Actions</h2>
      <ol className="mt-4 flex flex-col gap-4">
        {actions.map((action, i) => (
          <li key={action.id} className="flex gap-4">
            <span className="text-ink-300 font-mono text-[13px]">{i + 1}</span>
            <p className="text-ink-900 text-[15px] leading-[1.5]">
              <span className="font-semibold">{ACTION_TYPE_LABEL[action.actionType]}</span> —{" "}
              {action.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

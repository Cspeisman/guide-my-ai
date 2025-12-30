import { ArrowLeft } from "lucide-react";
import { Layout } from "../../layouts/Layout";
import { routes } from "../../routes";
import { CreatedAt } from "../../utils/created-at";

interface Props {
  name: string;
  content: string;
  createdAt: Date;
  currentUserName: string;
  userName: string;
}
export const UserResource = (props: Props) => {
  return (
    <Layout activeNav="rules" userName={props.currentUserName}>
      <div className="mb-4">
        <a
          href={routes.users.index.href({ user: props.userName })}
          className="inline-flex items-center gap-2 underline  hover:text-indigo-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{props.userName}'s Dashboard</span>
        </a>
      </div>
      <div className="block bg-white rounded-xl border border-gray-200 p-6 transition-all group">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-slate-900">{props.name}</h3>
        </div>
        <p className="bg-gray-50 whitespace-pre-wrap font-mono text-sm  p-4 rounded-lg">
          {props.content}
        </p>
        <CreatedAt date={props.createdAt} className="mt-4" />
      </div>
    </Layout>
  );
};

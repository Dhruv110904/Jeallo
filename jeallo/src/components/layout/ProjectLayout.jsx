import { Outlet } from 'react-router-dom';
import ProjectHeader from '../ProjectHeader';

export default function ProjectLayout() {
  return (
    <div className="h-full bg-white flex flex-col">
      <ProjectHeader />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

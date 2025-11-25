import { Routes, Route } from 'react-router-dom';
import Members from './Members';
import MemberDetail from './MemberDetail';
import CreateUser from './CreateUser';

export default function MembersRouter() {
  return (
    <Routes>
      <Route path="/" element={<Members />} />
      <Route path="/:id" element={<MemberDetail />} />
      <Route path="/create" element={<CreateUser />} />
    </Routes>
  );
}

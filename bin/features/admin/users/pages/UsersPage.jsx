import { useMemo, useState } from 'react';
import { RefreshCw, ShieldCheck, UserCheck, UserX, Users } from 'lucide-react';
import SearchInput from '@/components/common/SearchInput/SearchInput';
import { Select } from '@/components/common/Input/Input';
import Button from '@/components/common/Button/Button';
import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import EmptyState from '@/components/common/EmptyState/EmptyState';
import StatCard from '@/features/admin/components/StatCard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  USER_ROLES,
  USER_ROLE_LABELS,
  USER_STATUS,
  USER_STATUS_LABELS,
} from '@/data/constants/userRoles';
import { formatDate } from '@/shared/utils/formatDate';
import { normalizeKeyword } from '@/shared/utils/validators';
import { useAdminUsers } from '../hooks/useAdminUsers';

const ROLE_OPTIONS = Object.values(USER_ROLES).map((value) => ({
  value,
  label: USER_ROLE_LABELS[value],
}));
const STATUS_OPTIONS = Object.values(USER_STATUS).map((value) => ({
  value,
  label: USER_STATUS_LABELS[value],
}));

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { users, loading, error, savingId, refresh, updateRole, updateStatus } = useAdminUsers();
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => user.role === USER_ROLES.ADMIN).length,
      active: users.filter((user) => user.status === USER_STATUS.ACTIVE).length,
      locked: users.filter((user) => user.status === USER_STATUS.LOCKED).length,
    }),
    [users],
  );

  const filtered = useMemo(() => {
    const needle = normalizeKeyword(keyword);
    return users.filter((user) => {
      const matchesKeyword =
        !needle ||
        [user.fullName, user.email, user.phone, user.username]
          .map(normalizeKeyword)
          .some((value) => value.includes(needle));
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;
      return matchesKeyword && matchesRole && matchesStatus;
    });
  }, [users, keyword, roleFilter, statusFilter]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Người dùng</h2>
          <p>Quản lý tài khoản khách hàng, vai trò và quyền truy cập hệ thống.</p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={refresh} loading={loading}>
          Làm mới
        </Button>
      </div>

      <div className="stat-grid">
        <StatCard label="Tổng tài khoản" value={stats.total} icon={Users} tone="info" />
        <StatCard label="Quản trị viên" value={stats.admins} icon={ShieldCheck} tone="warning" />
        <StatCard label="Đang hoạt động" value={stats.active} icon={UserCheck} tone="success" />
        <StatCard label="Đã khóa" value={stats.locked} icon={UserX} tone="danger" />
      </div>

      <div className="admin-filters">
        <SearchInput
          value={keyword}
          onChange={setKeyword}
          placeholder="Tìm theo tên, email, số điện thoại..."
        />
        <Select
          aria-label="Lọc theo vai trò"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          options={[{ value: '', label: 'Tất cả vai trò' }, ...ROLE_OPTIONS]}
        />
        <Select
          aria-label="Lọc theo trạng thái"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          options={[{ value: '', label: 'Tất cả trạng thái' }, ...STATUS_OPTIONS]}
        />
        <span className="admin-count">{filtered.length} tài khoản</span>
      </div>

      {loading ? (
        <Loading label="Đang tải danh sách người dùng..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <div className="admin-table-card">
          <div className="table-wrap admin-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Liên hệ</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tham gia</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        title="Không tìm thấy người dùng"
                        description="Thử đổi từ khóa hoặc bộ lọc."
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => {
                    const isSelf = String(user.id) === String(currentUser?.id);
                    const isSaving = String(savingId) === String(user.id);
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="admin-user-cell">
                            <span className="admin-user-cell__avatar">
                              {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                            </span>
                            <div className="admin-user-cell__info">
                              <strong>
                                {user.fullName || user.username}
                                {isSelf ? ' (bạn)' : ''}
                              </strong>
                              <span>@{user.username}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="admin-table-book__info">
                            <strong>{user.email}</strong>
                            <span>{user.phone || 'Chưa cập nhật SĐT'}</span>
                          </div>
                        </td>
                        <td>
                          <select
                            className="select admin-inline-select"
                            value={user.role}
                            disabled={isSelf || isSaving}
                            aria-label={`Vai trò của ${user.fullName}`}
                            onChange={(event) => updateRole(user.id, event.target.value)}
                          >
                            {ROLE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            className="select admin-inline-select"
                            value={user.status}
                            disabled={isSelf || isSaving}
                            aria-label={`Trạng thái của ${user.fullName}`}
                            onChange={(event) => updateStatus(user.id, event.target.value)}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="muted">{formatDate(user.createdAt)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="admin-form-note">
        Bạn không thể tự thay đổi vai trò hoặc khóa tài khoản đang đăng nhập để tránh mất quyền quản
        trị.
      </p>
    </div>
  );
}

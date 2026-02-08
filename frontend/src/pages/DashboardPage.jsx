import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, endpoints } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const getDaysAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (Number.isNaN(diffDays)) {
    return '-';
  }

  if (diffDays <= 0) {
    return 'today';
  }

  if (diffDays === 1) {
    return '1 day ago';
  }

  return `${diffDays} days ago`;
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { token, user, logout, refreshProfile, updateProfile, deleteProfile } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [booting, setBooting] = useState(true);

  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 12 });
  const [editor, setEditor] = useState(null);
  const [toast, setToast] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    setProfileForm((previous) => ({
      ...previous,
      name: user?.name || '',
      email: user?.email || '',
      password: '',
    }));
  }, [user]);

  useEffect(() => {
    let alive = true;

    const syncSession = async () => {
      try {
        await refreshProfile();
      } catch {
        logout();
        navigate('/', { replace: true });
      } finally {
        if (alive) {
          setBooting(false);
        }
      }
    };

    syncSession();

    return () => {
      alive = false;
    };
  }, [logout, navigate, refreshProfile]);

  const loadUsers = useCallback(
    async (page = 1, searchText = '') => {
      if (!isAdmin || !token) {
        return;
      }

      setListLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: '12',
        });

        const trimmedSearch = searchText.trim();
        if (trimmedSearch) {
          params.set('q', trimmedSearch);
        }

        const response = await apiRequest(`${endpoints.users}?${params.toString()}`, {
          token,
        });

        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } catch (error) {
        setToast({ type: 'error', message: error.message });
      } finally {
        setListLoading(false);
      }
    },
    [isAdmin, token],
  );

  useEffect(() => {
    if (isAdmin) {
      loadUsers(1, '');
    }
  }, [isAdmin, loadUsers]);

  const stats = useMemo(() => {
    const adminCount = users.filter((entry) => entry.role === 'admin').length;
    const freshUsers = users.filter((entry) => {
      const created = new Date(entry.createdAt);
      return Date.now() - created.getTime() <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      usersLoaded: pagination.total,
      adminsOnline: adminCount,
      joinedThisWeek: freshUsers,
    };
  }, [pagination.total, users]);

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadUsers(1, query);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      return;
    }

    const payload = {};

    const trimmedName = profileForm.name.trim();
    const trimmedEmail = profileForm.email.trim();

    if (trimmedName && trimmedName !== user.name) {
      payload.name = trimmedName;
    }

    if (trimmedEmail && trimmedEmail.toLowerCase() !== user.email.toLowerCase()) {
      payload.email = trimmedEmail;
    }

    if (profileForm.password) {
      payload.password = profileForm.password;
    }

    if (Object.keys(payload).length === 0) {
      setToast({ type: 'info', message: 'No profile changes detected' });
      return;
    }

    setProfileSaving(true);
    try {
      await updateProfile(payload);
      setProfileForm((previous) => ({ ...previous, password: '' }));
      setToast({ type: 'success', message: 'Profile updated successfully' });
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Delete your own account permanently? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      await deleteProfile();
      navigate('/', { replace: true });
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    }
  };

  const handleUserEditSave = async () => {
    if (!editor) {
      return;
    }

    try {
      await apiRequest(`${endpoints.users}/${editor.id}`, {
        method: 'PATCH',
        token,
        body: {
          name: editor.name,
          email: editor.email,
          role: editor.role,
        },
      });

      setToast({ type: 'success', message: 'User updated' });
      setEditor(null);
      await loadUsers(pagination.page, query);
      if (editor.id === user?.id) {
        await refreshProfile();
      }
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    }
  };

  const handleUserDelete = async (targetUser) => {
    const confirmed = window.confirm(`Delete ${targetUser.name}? This action is permanent.`);
    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`${endpoints.users}/${targetUser.id}`, {
        method: 'DELETE',
        token,
      });

      setToast({ type: 'success', message: 'User deleted' });
      await loadUsers(pagination.page, query);

      if (targetUser.id === user?.id) {
        logout();
        navigate('/', { replace: true });
      }
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    }
  };

  if (booting) {
    return (
      <main className="page-shell loading-shell">
        <div className="panel loading-panel">Synchronizing mission control...</div>
      </main>
    );
  }

  return (
    <main className="page-shell dashboard-shell">
      <header className="panel topbar fade-up">
        <div>
          <p className="badge">PulseAuth Console</p>
          <h1>Hey {user?.name?.split(' ')[0] || 'Operator'}, ready to ship?</h1>
          <p className="muted-text">
            Role: <strong>{user?.role || 'member'}</strong> | Last login:{' '}
            {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'first login'}
          </p>
        </div>

        <div className="topbar-actions">
          {isAdmin ? (
            <button className="secondary-button" onClick={() => loadUsers(pagination.page, query)}>
              Refresh users
            </button>
          ) : null}
          <button className="ghost-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="stats-grid fade-up delay-1">
        <article className="panel stat-card">
          <p>Total users</p>
          <h3>{isAdmin ? stats.usersLoaded : '-'}</h3>
        </article>
        <article className="panel stat-card">
          <p>Admins in page</p>
          <h3>{isAdmin ? stats.adminsOnline : user?.role === 'admin' ? '1' : '0'}</h3>
        </article>
        <article className="panel stat-card">
          <p>Joined this week</p>
          <h3>{isAdmin ? stats.joinedThisWeek : '-'}</h3>
        </article>
      </section>

      <section className="dashboard-grid fade-up delay-2">
        <article className="panel profile-panel">
          <h2>Profile Studio</h2>
          <p className="muted-text">Keep your identity sharp. Change details and rotate passwords often.</p>

          <form className="auth-form" onSubmit={handleProfileSubmit}>
            <label>
              Display name
              <input
                name="name"
                type="text"
                value={profileForm.name}
                onChange={handleProfileChange}
                required
              />
            </label>

            <label>
              Email
              <input
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
              />
            </label>

            <label>
              New password
              <input
                name="password"
                type="password"
                value={profileForm.password}
                onChange={handleProfileChange}
                placeholder="Optional"
              />
            </label>

            <button className="cta-button" type="submit" disabled={profileSaving}>
              {profileSaving ? 'Saving...' : 'Save profile'}
            </button>
          </form>

          <div className="danger-zone">
            <h3>Danger zone</h3>
            <p className="muted-text">
              This deletes your account immediately. If you are the last admin, API will block the action.
            </p>
            <button className="danger-button" type="button" onClick={handleDeleteAccount}>
              Delete my account
            </button>
          </div>
        </article>

        <article className="panel users-panel">
          <h2>Team Directory</h2>
          {!isAdmin ? (
            <p className="muted-text">
              You are signed in as a member. Ask an admin for management privileges to view all accounts.
            </p>
          ) : (
            <>
              <form className="search-row" onSubmit={handleSearch}>
                <input
                  type="search"
                  placeholder="Search by name or email"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <button className="secondary-button" type="submit">
                  Search
                </button>
              </form>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listLoading ? (
                      <tr>
                        <td colSpan="5">Loading users...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="5">No users found</td>
                      </tr>
                    ) : (
                      users.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.name}</td>
                          <td>{entry.email}</td>
                          <td>
                            <span className={`role-chip role-${entry.role}`}>{entry.role}</span>
                          </td>
                          <td>{getDaysAgo(entry.createdAt)}</td>
                          <td className="row-actions">
                            <button
                              type="button"
                              className="tiny-button"
                              onClick={() => setEditor({ ...entry })}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="tiny-button tiny-danger"
                              onClick={() => handleUserDelete(entry)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination-row">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={pagination.page <= 1 || listLoading}
                  onClick={() => loadUsers(pagination.page - 1, query)}
                >
                  Prev
                </button>
                <span>
                  Page {pagination.page} / {pagination.pages}
                </span>
                <button
                  type="button"
                  className="secondary-button"
                  disabled={pagination.page >= pagination.pages || listLoading}
                  onClick={() => loadUsers(pagination.page + 1, query)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </article>
      </section>

      {editor ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit user">
          <div className="modal panel">
            <h3>Edit user</h3>
            <label>
              Name
              <input
                type="text"
                value={editor.name}
                onChange={(event) => setEditor((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={editor.email}
                onChange={(event) => setEditor((prev) => ({ ...prev, email: event.target.value }))}
              />
            </label>
            <label>
              Role
              <select
                value={editor.role}
                onChange={(event) => setEditor((prev) => ({ ...prev, role: event.target.value }))}
              >
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>
            </label>

            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setEditor(null)}>
                Cancel
              </button>
              <button className="cta-button" type="button" onClick={handleUserEditSave}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </main>
  );
};

export default DashboardPage;

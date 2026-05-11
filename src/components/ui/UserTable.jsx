import UserTypeBadge from "../ui/UserTypeBadge";
import UserStatusBadge from "../ui/UserStatusBadge";

export default function UserTable({ users, onActivate, onDeactivate, isActing }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Desktop table */}
      <div className="hidden sm:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              {["Username", "Email", "Role", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const isSuperadmin = user.user_type === "SUPERADMIN";
              const isBeingActedOn = isActing === user.userId;

              return (
                <tr
                  key={user.userId}
                  className={
                    isSuperadmin
                      ? "bg-gray-50/60"
                      : "hover:bg-gray-50/40 transition-colors"
                  }
                >
                  {/* Username */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isSuperadmin && (
                        <svg
                          className="h-3.5 w-3.5 flex-shrink-0 text-purple-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span
                        className={`text-sm font-medium ${
                          isSuperadmin ? "text-gray-400" : "text-gray-900"
                        }`}
                      >
                        {user.username || "—"}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td
                    className={`px-4 py-3 text-sm ${
                      isSuperadmin ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    {user.email || "—"}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <UserTypeBadge userType={user.user_type} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    {isSuperadmin ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      <UserStatusBadge status={user.record_status} />
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <SuperadminGuardedActions
                      user={user}
                      isSuperadmin={isSuperadmin}
                      isBeingActedOn={isBeingActedOn}
                      onActivate={onActivate}
                      onDeactivate={onDeactivate}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <ul className="divide-y divide-gray-100 sm:hidden">
        {users.map((user) => {
          const isSuperadmin = user.user_type === "SUPERADMIN";
          const isBeingActedOn = isActing === user.userId;

          return (
            <li
              key={user.userId}
              className={`p-4 ${isSuperadmin ? "bg-gray-50/60" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {isSuperadmin && (
                      <svg
                        className="h-3.5 w-3.5 flex-shrink-0 text-purple-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <p
                      className={`truncate text-sm font-medium ${
                        isSuperadmin ? "text-gray-400" : "text-gray-900"
                      }`}
                    >
                      {user.username || "—"}
                    </p>
                  </div>
                  {/* ✅ removed firstname/lastname — user table only has email */}
                  <p
                    className={`mt-0.5 truncate text-xs ${
                      isSuperadmin ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {user.email || "—"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <UserTypeBadge userType={user.user_type} />
                    {!isSuperadmin && (
                      <UserStatusBadge status={user.record_status} />
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <SuperadminGuardedActions
                    user={user}
                    isSuperadmin={isSuperadmin}
                    isBeingActedOn={isBeingActedOn}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                    mobile
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SuperadminGuardedActions({
  user,
  isSuperadmin,
  isBeingActedOn,
  onActivate,
  onDeactivate,
  mobile,
}) {
  const isActive = user.record_status === "ACTIVE";
  const isDisabled = isBeingActedOn || isSuperadmin;

  return (
    <div
      className={`group relative flex gap-2 ${mobile ? "flex-col" : "items-center"}`}
    >
      {/* Tooltip for Superadmin */}
      {isSuperadmin && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden w-52 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-1.5 text-center text-xs text-white shadow-lg group-hover:block">
          SUPERADMIN accounts cannot be modified
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}

      {/* Activate — shown only when INACTIVE */}
      {!isActive && (
        <button
          onClick={() => onActivate(user)}
          disabled={isDisabled}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBeingActedOn ? (
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          )}
          Activate
        </button>
      )}

      {/* Deactivate — shown only when ACTIVE */}
      {isActive && (
        <button
          onClick={() => onDeactivate(user)}
          disabled={isDisabled}
          className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isBeingActedOn ? (
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          )}
          Deactivate
        </button>
      )}
    </div>
  );
}
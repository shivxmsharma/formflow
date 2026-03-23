import useSocketStore from "../../store/socketStore";
import useAuthStore from "../../store/authStore";

// Shows avatar circles of everyone currently in the form room
// Renders in the BuilderPage top bar
export default function PresenceBar() {
    const { onlineUsers, isConnected } = useSocketStore();
    const { user: currentUser } = useAuthStore();

    if (!isConnected && onlineUsers.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            {/* Connection status dot */}
            <div className="flex items-center gap-1.5">
                <div
                    className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-400" : "bg-gray-300"
                        }`}
                />
                <span className="text-xs text-gray-400 hidden sm:block">
                    {isConnected ? "Live" : "Offline"}
                </span>
            </div>

            {/* Avatar stack */}
            {onlineUsers.length > 0 && (
                <div className="flex items-center -space-x-2">
                    {onlineUsers.slice(0, 5).map((user) => (
                        <UserAvatar
                            key={user.id}
                            user={user}
                            isCurrentUser={user.id === currentUser?.id}
                        />
                    ))}
                    {onlineUsers.length > 5 && (
                        <div
                            className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white
                         flex items-center justify-center text-xs font-medium text-gray-600"
                            title={`${onlineUsers.length - 5} more`}
                        >
                            +{onlineUsers.length - 5}
                        </div>
                    )}
                </div>
            )}

            {/* Collaborator count label */}
            {onlineUsers.length > 1 && (
                <span className="text-xs text-gray-400 hidden sm:block">
                    {onlineUsers.length} editing
                </span>
            )}
        </div>
    );
}

function UserAvatar({ user, isCurrentUser }) {
    const initials = user.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    return (
        <div
            title={isCurrentUser ? `${user.name} (you)` : user.name}
            className="w-7 h-7 rounded-full border-2 border-white flex items-center
                 justify-center text-xs font-semibold text-white flex-shrink-0
                 cursor-default select-none"
            style={{ backgroundColor: user.color }}
        >
            {initials}
        </div>
    );
}
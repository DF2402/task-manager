import { useGet } from "../hooks/useGet";

export default function DemoPage() {
  const userList = useGet<{
    error?: string;
    users: { id: number; name: string }[];
  }>({ url: "/api/users", name: "user list" });

  return (
    <div>
      {userList.render((data) => {
        return (
          <div>
            {data.users.map((user) => {
              return <div key={user.id}>{user.name}</div>;
            })}
          </div>
        );
      })}

      {userList.data === "loading" ? (
        <div>Loading...</div>
      ) : userList.data.error ? (
        <div>Failed to load user list: {userList.data.error}</div>
      ) : (
        <div>
          {userList.data.users.map((user) => {
            return <div key={user.id}>{user.name}</div>;
          })}
        </div>
      )}
    </div>
  );
}

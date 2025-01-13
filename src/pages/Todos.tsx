import TodoList from "@/components/TodoList";

const Todos = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <h1 className="text-3xl font-bold mb-8">Todos</h1>
      <TodoList />
    </div>
  );
};

export default Todos;
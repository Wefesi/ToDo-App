using TodoApp.Api.Models;

namespace TodoApp.Api.Services;

public class ToDoService : IToDoService
{
    private readonly List<ToDo> todos = [];
    private int nextId = 1;

    public IReadOnlyList<ToDo> GetAll()
    {
        return todos;
    }

    public ToDo Create(string title, bool isCompleted)
    {
        var todo = new ToDo
        {
            Id = nextId++,
            Title = title,
            IsCompleted = isCompleted
        };

        todos.Add(todo);
        return todo;
    }

    public ToDo? Update(int id, string title, bool isCompleted)
    {
        var todo = todos.SingleOrDefault(todo => todo.Id == id);

        if (todo is null)
        {
            return null;
        }

        todo.Title = title;
        todo.IsCompleted = isCompleted;
        return todo;
    }

    public bool Delete(int id)
    {
        var todo = todos.SingleOrDefault(todo => todo.Id == id);

        return todo is not null && todos.Remove(todo);
    }
}

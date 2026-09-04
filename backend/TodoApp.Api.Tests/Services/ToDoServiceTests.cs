using TodoApp.Api.Services;

namespace TodoApp.Api.Tests.Services;

public class ToDoServiceTests
{
    [Fact]
    public void GetAll_returns_an_empty_list_for_a_new_service()
    {
        var service = new ToDoService();

        var todos = service.GetAll();

        Assert.Empty(todos);
    }

    [Fact]
    public void Create_adds_an_incomplete_todo_with_a_generated_id()
    {
        var service = new ToDoService();

        var todo = service.Create("Learn Kubernetes", false);

        Assert.Equal(1, todo.Id);
        Assert.Equal("Learn Kubernetes", todo.Title);
        Assert.False(todo.IsCompleted);
        Assert.Single(service.GetAll());
    }

    [Fact]
    public void Create_preserves_an_explicit_completion_state()
    {
        var service = new ToDoService();

        var todo = service.Create("Set up the repository", true);

        Assert.True(todo.IsCompleted);
    }

    [Fact]
    public void Create_generates_unique_ids()
    {
        var service = new ToDoService();

        var first = service.Create("First", false);
        var second = service.Create("Second", false);

        Assert.Equal(1, first.Id);
        Assert.Equal(2, second.Id);
    }

    [Fact]
    public void Update_changes_an_existing_todo()
    {
        var service = new ToDoService();
        service.Create("Learn Kubernetes", false);

        var todo = service.Update(1, "Learn Kubernetes locally", true);

        Assert.NotNull(todo);
        Assert.Equal("Learn Kubernetes locally", todo.Title);
        Assert.True(todo.IsCompleted);
    }

    [Fact]
    public void Update_returns_null_for_an_unknown_id()
    {
        var service = new ToDoService();

        var todo = service.Update(999, "Unknown", false);

        Assert.Null(todo);
    }

    [Fact]
    public void Delete_removes_an_existing_todo()
    {
        var service = new ToDoService();
        service.Create("Learn Kubernetes", false);

        var deleted = service.Delete(1);

        Assert.True(deleted);
        Assert.Empty(service.GetAll());
    }

    [Fact]
    public void Delete_returns_false_for_an_unknown_id()
    {
        var service = new ToDoService();

        var deleted = service.Delete(999);

        Assert.False(deleted);
    }
}

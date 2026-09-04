using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using TodoApp.Api.Models;

namespace TodoApp.Api.Tests;

public class ApiTests
{
    [Fact]
    public async Task GetTodos_returns_200_and_an_empty_array()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/todos");
        var todos = await response.Content.ReadFromJsonAsync<List<ToDo>>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(todos);
        Assert.Empty(todos);
    }

    [Fact]
    public async Task PostTodo_returns_201_and_the_created_todo()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/todos", new
        {
            title = "Learn Kubernetes"
        });
        var todo = await response.Content.ReadFromJsonAsync<ToDo>();

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(todo);
        Assert.Equal(1, todo.Id);
        Assert.Equal("Learn Kubernetes", todo.Title);
        Assert.False(todo.IsCompleted);
        Assert.Equal("/api/todos/1", response.Headers.Location?.OriginalString);
    }

    [Fact]
    public async Task PostTodo_returns_400_for_an_invalid_title()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/todos", new
        {
            title = "   "
        });
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True(problem.GetProperty("errors").TryGetProperty("Title", out _));
    }

    [Fact]
    public async Task PutTodo_returns_200_and_the_updated_todo()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();
        await client.PostAsJsonAsync("/api/todos", new { title = "Initial title" });

        var response = await client.PutAsJsonAsync("/api/todos/1", new
        {
            title = "Updated title",
            isCompleted = true
        });
        var todo = await response.Content.ReadFromJsonAsync<ToDo>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(todo);
        Assert.Equal(1, todo.Id);
        Assert.Equal("Updated title", todo.Title);
        Assert.True(todo.IsCompleted);
    }

    [Fact]
    public async Task PutTodo_returns_400_for_an_invalid_title()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();
        await client.PostAsJsonAsync("/api/todos", new { title = "Initial title" });

        var response = await client.PutAsJsonAsync("/api/todos/1", new
        {
            title = "",
            isCompleted = false
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PutTodo_returns_404_for_an_unknown_id()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var response = await client.PutAsJsonAsync("/api/todos/999", new
        {
            title = "Missing todo",
            isCompleted = false
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteTodo_returns_204_and_removes_the_todo()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();
        await client.PostAsJsonAsync("/api/todos", new { title = "Delete me" });

        var response = await client.DeleteAsync("/api/todos/1");
        var listResponse = await client.GetAsync("/api/todos");
        var todos = await listResponse.Content.ReadFromJsonAsync<List<ToDo>>();

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.NotNull(todos);
        Assert.Empty(todos);
    }

    [Fact]
    public async Task DeleteTodo_returns_404_for_an_unknown_id()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var response = await client.DeleteAsync("/api/todos/999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Health_returns_200_and_ok_status()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/health");
        var health = await response.Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("ok", health.GetProperty("status").GetString());
    }
}

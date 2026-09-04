using System.ComponentModel.DataAnnotations;
using TodoApp.Api.Models;

namespace TodoApp.Api.Tests.Models;

public class ToDoValidationTests
{
    [Fact]
    public void New_todo_starts_incomplete()
    {
        var todo = new ToDo { Title = "Learn Kubernetes" };

        Assert.False(todo.IsCompleted);
    }

    [Fact]
    public void Title_is_valid_when_it_contains_text()
    {
        var todo = new ToDo { Title = "Learn Kubernetes" };

        var errors = Validate(todo);

        Assert.Empty(errors);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("\t\n")]
    public void Title_is_invalid_when_it_is_empty_or_whitespace(string title)
    {
        var todo = new ToDo { Title = title };

        var errors = Validate(todo);

        Assert.Contains(errors, error => error.MemberNames.Contains(nameof(ToDo.Title)));
    }

    [Fact]
    public void Title_is_invalid_when_it_exceeds_200_characters()
    {
        var todo = new ToDo { Title = new string('a', 201) };

        var errors = Validate(todo);

        Assert.Contains(errors, error => error.MemberNames.Contains(nameof(ToDo.Title)));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("\t\n")]
    public void Create_request_rejects_an_empty_or_whitespace_title(string title)
    {
        var request = new CreateToDoRequest { Title = title };

        var errors = Validate(request);

        Assert.Contains(errors, error => error.MemberNames.Contains(nameof(CreateToDoRequest.Title)));
    }

    [Fact]
    public void Update_request_rejects_a_title_longer_than_200_characters()
    {
        var request = new UpdateToDoRequest { Title = new string('a', 201) };

        var errors = Validate(request);

        Assert.Contains(errors, error => error.MemberNames.Contains(nameof(UpdateToDoRequest.Title)));
    }

    private static IReadOnlyList<ValidationResult> Validate(object model)
    {
        var context = new ValidationContext(model);
        var errors = new List<ValidationResult>();

        Validator.TryValidateObject(model, context, errors, validateAllProperties: true);

        return errors;
    }
}

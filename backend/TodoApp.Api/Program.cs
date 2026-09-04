using System.ComponentModel.DataAnnotations;
using TodoApp.Api.Models;
using TodoApp.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSingleton<IToDoService, ToDoService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (builder.Configuration.GetValue<bool>("HttpsRedirection:Enabled"))
{
    app.UseHttpsRedirection();
}

if (app.Environment.IsDevelopment())
{
    app.UseCors("DevelopmentFrontend");
}

app.MapGet("/api/todos", (IToDoService todoService) =>
    Results.Ok(todoService.GetAll()));

app.MapPost("/api/todos", (CreateToDoRequest request, IToDoService todoService) =>
{
    var validationContext = new ValidationContext(request);
    var validationErrors = new List<ValidationResult>();

    if (!Validator.TryValidateObject(request, validationContext, validationErrors, true))
    {
        return Results.ValidationProblem(
            validationErrors
                .SelectMany(error => error.MemberNames.DefaultIfEmpty(string.Empty),
                    (error, memberName) => new { memberName, error.ErrorMessage })
                .GroupBy(error => error.memberName)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(error => error.ErrorMessage ?? "Invalid value.").ToArray()));
    }

    var todo = todoService.Create(request.Title, request.IsCompleted);
    return Results.Created($"/api/todos/{todo.Id}", todo);
});

app.MapPut("/api/todos/{id:int}", (int id, UpdateToDoRequest request, IToDoService todoService) =>
{
    var validationContext = new ValidationContext(request);
    var validationErrors = new List<ValidationResult>();

    if (!Validator.TryValidateObject(request, validationContext, validationErrors, true))
    {
        return Results.ValidationProblem(
            validationErrors
                .SelectMany(error => error.MemberNames.DefaultIfEmpty(string.Empty),
                    (error, memberName) => new { memberName, error.ErrorMessage })
                .GroupBy(error => error.memberName)
                .ToDictionary(
                    group => group.Key,
                    group => group.Select(error => error.ErrorMessage ?? "Invalid value.").ToArray()));
    }

    var todo = todoService.Update(id, request.Title, request.IsCompleted);
    return todo is null ? Results.NotFound() : Results.Ok(todo);
});

app.MapDelete("/api/todos/{id:int}", (int id, IToDoService todoService) =>
    todoService.Delete(id) ? Results.NoContent() : Results.NotFound());

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();

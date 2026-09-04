using TodoApp.Api.Models;

namespace TodoApp.Api.Services;

public interface IToDoService
{
    IReadOnlyList<ToDo> GetAll();

    ToDo Create(string title, bool isCompleted);

    ToDo? Update(int id, string title, bool isCompleted);

    bool Delete(int id);
}

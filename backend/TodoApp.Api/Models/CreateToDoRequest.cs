using System.ComponentModel.DataAnnotations;

namespace TodoApp.Api.Models;

public class CreateToDoRequest : IValidatableObject
{
    [Required]
    [StringLength(70)]
    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; } = false;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(Title))
        {
            yield return new ValidationResult(
                "Title must not be empty or whitespace.",
                [nameof(Title)]);
        }
    }
}

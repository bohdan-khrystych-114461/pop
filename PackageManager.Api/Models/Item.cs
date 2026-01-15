namespace PackageManager.Api.Models;

public class Item
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? ImageUrl { get; set; }
}

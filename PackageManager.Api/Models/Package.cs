namespace PackageManager.Api.Models;

public class Package
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? BoxSize { get; set; }
    public decimal TotalWeight { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public List<PackageItem> PackageItems { get; set; } = new();
}

public class PackageItem
{
    public int Id { get; set; }
    public int PackageId { get; set; }
    public int? ItemId { get; set; }
    public required string ItemName { get; set; }
    public string? ItemImageUrl { get; set; }
    public int Quantity { get; set; } = 1;
    public Package Package { get; set; } = null!;
}

namespace PackageManager.Api.Models;

public record ItemDto(int Id, string Name, string? ImageUrl);

public record PackageItemDto(int Id, int? ItemId, string ItemName, string? ItemImageUrl, int Quantity);

public record PackageDto(
    int Id,
    string Name,
    string? BoxSize,
    decimal TotalWeight,
    bool IsCompleted,
    DateTime CreatedDate,
    List<PackageItemDto> Items
);

public record CreatePackageRequest(string Name, string? BoxSize);

public record UpdateWeightRequest(decimal Weight);

public record UpdateBoxSizeRequest(string? BoxSize);

public record AddItemToPackageRequest(int ItemId);

public record CreateItemRequest(string Name, string? ImageUrl);

public record UpdateItemRequest(string Name, string? ImageUrl);

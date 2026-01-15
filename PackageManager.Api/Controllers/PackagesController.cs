using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PackageManager.Api.Data;
using PackageManager.Api.Models;

namespace PackageManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PackagesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PackagesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<PackageDto>>> GetPackages()
    {
        var packages = await _context.Packages
            .Include(p => p.PackageItems)
            .OrderByDescending(p => p.CreatedDate)
            .ToListAsync();

        return packages.Select(MapToDto).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PackageDto>> GetPackage(int id)
    {
        var package = await _context.Packages
            .Include(p => p.PackageItems)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (package == null)
            return NotFound();

        return MapToDto(package);
    }

    [HttpPost]
    public async Task<ActionResult<PackageDto>> CreatePackage(CreatePackageRequest request)
    {
        var package = new Package
        {
            Name = request.Name,
            BoxSize = request.BoxSize,
            CreatedDate = DateTime.UtcNow
        };

        _context.Packages.Add(package);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPackage), new { id = package.Id }, MapToDto(package));
    }

    [HttpPost("{id}/items")]
    public async Task<ActionResult> AddItemToPackage(int id, AddItemToPackageRequest request)
    {
        var package = await _context.Packages
            .Include(p => p.PackageItems)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (package == null)
            return NotFound("Package not found");

        var item = await _context.Items.FindAsync(request.ItemId);
        if (item == null)
            return NotFound("Item not found");

        var existingPackageItem = package.PackageItems
            .FirstOrDefault(pi => pi.ItemId == request.ItemId);

        if (existingPackageItem != null)
        {
            existingPackageItem.Quantity++;
        }
        else
        {
            var packageItem = new PackageItem
            {
                PackageId = package.Id,
                ItemId = item.Id,
                ItemName = item.Name,
                ItemImageUrl = item.ImageUrl,
                Quantity = 1
            };
            package.PackageItems.Add(packageItem);
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{id}/items/{itemId}")]
    public async Task<ActionResult> RemoveItemFromPackage(int id, int itemId)
    {
        var package = await _context.Packages
            .Include(p => p.PackageItems)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (package == null)
            return NotFound("Package not found");

        var packageItem = package.PackageItems
            .FirstOrDefault(pi => pi.ItemId == itemId);

        if (packageItem == null)
            return NotFound("Item not found in package");

        if (packageItem.Quantity > 1)
        {
            packageItem.Quantity--;
        }
        else
        {
            package.PackageItems.Remove(packageItem);
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("{id}/weight")]
    public async Task<ActionResult> UpdateWeight(int id, UpdateWeightRequest request)
    {
        var package = await _context.Packages.FindAsync(id);
        if (package == null)
            return NotFound();

        package.TotalWeight = request.Weight;
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPut("{id}/boxsize")]
    public async Task<ActionResult> UpdateBoxSize(int id, UpdateBoxSizeRequest request)
    {
        var package = await _context.Packages.FindAsync(id);
        if (package == null)
            return NotFound();

        package.BoxSize = request.BoxSize;
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPut("{id}/complete")]
    public async Task<ActionResult> CompletePackage(int id)
    {
        var package = await _context.Packages.FindAsync(id);
        if (package == null)
            return NotFound();

        package.IsCompleted = true;
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpPut("{id}/uncomplete")]
    public async Task<ActionResult> UncompletePackage(int id)
    {
        var package = await _context.Packages.FindAsync(id);
        if (package == null)
            return NotFound();

        package.IsCompleted = false;
        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePackage(int id)
    {
        var package = await _context.Packages.FindAsync(id);
        if (package == null)
            return NotFound();

        _context.Packages.Remove(package);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static PackageDto MapToDto(Package package)
    {
        return new PackageDto(
            package.Id,
            package.Name,
            package.BoxSize,
            package.TotalWeight,
            package.IsCompleted,
            package.CreatedDate,
            package.PackageItems.Select(pi => new PackageItemDto(
                pi.Id,
                pi.ItemId,
                pi.ItemName,
                pi.ItemImageUrl,
                pi.Quantity
            )).ToList()
        );
    }
}

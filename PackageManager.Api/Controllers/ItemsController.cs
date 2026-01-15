using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PackageManager.Api.Data;
using PackageManager.Api.Models;

namespace PackageManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ItemsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ItemDto>>> GetItems()
    {
        var items = await _context.Items
            .OrderBy(i => i.Name)
            .ToListAsync();

        return items.Select(i => new ItemDto(i.Id, i.Name, i.ImageUrl)).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ItemDto>> GetItem(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null)
            return NotFound();

        return new ItemDto(item.Id, item.Name, item.ImageUrl);
    }

    [HttpPost]
    public async Task<ActionResult<ItemDto>> CreateItem(CreateItemRequest request)
    {
        var item = new Item
        {
            Name = request.Name,
            ImageUrl = request.ImageUrl
        };

        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        var dto = new ItemDto(item.Id, item.Name, item.ImageUrl);
        return CreatedAtAction(nameof(GetItem), new { id = item.Id }, dto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateItem(int id, UpdateItemRequest request)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null)
            return NotFound();

        item.Name = request.Name;
        item.ImageUrl = request.ImageUrl;

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteItem(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null)
            return NotFound();

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}


using API.Data.Entities;
using MongoDB.Driver;

namespace API.Data
{
    public interface IOdyseeExtenstionDbContext
    {
        IMongoCollection<User> Users { get; }
    }
}
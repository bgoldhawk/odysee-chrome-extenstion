
using API.Data.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace API.Data
{

    public class OdyseeExtenstionDbContext : IOdyseeExtenstionDbContext
    {
        private IMongoDatabase _db;
        private ILogger<OdyseeExtenstionDbContext> _logger;

        public OdyseeExtenstionDbContext(IConfiguration configuration, ILogger<OdyseeExtenstionDbContext> logger)
        {
            var mongoClient = new MongoClient(configuration.GetConnectionString("default"));
            _db = mongoClient.GetDatabase("OdyseeUsersWatchedList");

            _logger = logger;
        }

        public IMongoCollection<User> Users
        {
            get
            {
                return _db.GetCollection<User>("Users");
            }
        }
    }
}

using System;
using System.Threading.Tasks;
using API.Data.Entities;
using MongoDB.Driver;
using System.Linq;

namespace API.Data.Services
{
    public interface IUserService
    {
        Task<User> GetByIdAsync(Guid userId);
        Task UpsertAsync(User user);
    }

    public class UserService : IUserService
    {
        private IOdyseeExtenstionDbContext _odyseeExtenstionDbContext;
        private IMongoCollection<User> _userCollection;



        public UserService(IOdyseeExtenstionDbContext odyseeExtenstionDbContext)
        {
            _odyseeExtenstionDbContext = odyseeExtenstionDbContext;
            _userCollection = _odyseeExtenstionDbContext.Users;
        }

        public async Task<User> GetByIdAsync(Guid userId)
        {
            return (await _odyseeExtenstionDbContext.Users.FindAsync(u => u.Id.Equals(userId))).FirstOrDefault();
        }

        public async Task UpsertAsync(User user)
        {
            user.LastModifed = DateTime.UtcNow;

            await _odyseeExtenstionDbContext.Users.ReplaceOneAsync<User>(u => u.Id.Equals(user.Id), user, new ReplaceOptions { IsUpsert = true });
        }
    }
}
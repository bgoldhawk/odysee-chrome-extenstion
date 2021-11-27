
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using API.Data.Entities;
using System;
using API.ViewModels;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using MongoDB.Bson;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserVideoController : ControllerBase
    {
        private IConfiguration _configuration;
        private MongoClient mongoDb;

        public UserVideoController(IConfiguration configuration)
        {
            _configuration = configuration;
            mongoDb = new MongoClient("mongodb://root:developmenT!@mongo:27017/");

        }

        

        [HttpPost("SyncNewTime")]
        public async Task<IActionResult> SyncNewTimeAsync(SyncedVideoViewModel syncedVideoViewModel)
        {
            var db = mongoDb.GetDatabase("OdyseeUsersWatchedList");

            var users = db.GetCollection<User>("Users");

            User user =  null;
            
            if(syncedVideoViewModel.UserId.HasValue) 
               user = (await users.FindAsync(u => u.Id.Equals(syncedVideoViewModel.UserId.Value))).FirstOrDefault();


            if(user == null)
            {
                user = new User();

                await users.InsertOneAsync(user);
                    
            }

            var watched_video = user.WatchList.FirstOrDefault(v => v.VideoTitle.ToLower().Equals(syncedVideoViewModel.VideoTitle.ToLower()));

            if(watched_video == null)
            {
                watched_video = new Videos();
                watched_video.VideoTitle = syncedVideoViewModel.VideoTitle.ToLower();
                user.WatchList.Add(watched_video);
            }
            
            watched_video.WatchTime = syncedVideoViewModel.WatchTime;
            watched_video.LastModified = DateTime.UtcNow;

            user.LastModifed = DateTime.UtcNow;

            users.ReplaceOne<User>(u => u.Id.Equals(user.Id), user, new ReplaceOptions{IsUpsert = true});

            return Ok(user.Id);

        }
        
    }
}

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
using API.Data;
using API.Data.Services;
using System.Web;

namespace API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserVideoController : ControllerBase
    {
        private IUserService _userService;

        public UserVideoController(IUserService userService)
        {
            _userService = userService;
        }


        [HttpPost("SyncNewTime")]
        public async Task<IActionResult> SyncNewTimeAsync(SyncedVideoViewModel syncedVideoViewModel)
        {
            if (ModelState.IsValid)
            {
                User user = null;

                if (syncedVideoViewModel.UserId.HasValue)
                {
                    user = await _userService.GetByIdAsync(syncedVideoViewModel.UserId.Value);

                    if(user == null)
                        return NotFound($"Unable to find user id {syncedVideoViewModel.UserId.Value}");
                }
                    

                if (user == null)
                {
                    user = new User();
                }

                var watched_video = user.WatchList.FirstOrDefault(v => v.VideoTitle.ToLower().Equals(syncedVideoViewModel.VideoTitle.ToLower()));

                if (watched_video == null)
                {
                    watched_video = new Videos();
                    watched_video.VideoTitle = syncedVideoViewModel.VideoTitle.ToLower();
                    user.WatchList.Add(watched_video);
                }

                watched_video.WatchTime = syncedVideoViewModel.WatchTime;
                watched_video.LastModified = DateTime.UtcNow;

                await _userService.UpsertAsync(user);

                return Ok(user.Id);
            }

            return BadRequest(ModelState);
        }

        [HttpGet("GetAllWatched/{userId}")]
        public async Task<IActionResult> GetAllWatchedAsync(Guid userId)
        {
            var user = await _userService.GetByIdAsync(userId);

            if(user == null)
                return NotFound($"Unable to find user id {userId}");

            return Ok(user.WatchList);
        }

        [HttpGet("GetAllWatched/{userId}/{videoTitle}")]
        public async Task<IActionResult> GetAllWatchedAsync(Guid userId, string videoTitle)
        {
            var user = await _userService.GetByIdAsync(userId);

            if(user == null)
                return NotFound($"Unable to find user id {userId}");

            var video = user.WatchList.FirstOrDefault(v => v.VideoTitle.ToLower().Equals(HttpUtility.UrlDecode(videoTitle).ToLower()));

            if(video == null)
                return NotFound($"Video not in watch list: {HttpUtility.UrlDecode(videoTitle)}");

            return Ok(video);
        }

    }
}
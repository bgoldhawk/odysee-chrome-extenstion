using System;
using System.ComponentModel.DataAnnotations;

namespace API.ViewModels
{
    public class SyncedVideoViewModel
    {
        public Guid? UserId { get; set; }

        [Required]
        public string ChannelName { get; set; }

        [Required]
        public string VideoName { get; set; }

        [Required]
        public double WatchTime { get; set; }

    }
}
using System;
using System.ComponentModel.DataAnnotations;

namespace API.ViewModels
{
    public class SyncedVideoViewModel
    {
        public Guid? UserId { get; set; }
        
        [Required]
        public string VideoTitle { get; set; }

        [Required]
        public double WatchTime { get; set; }
        
    }
}
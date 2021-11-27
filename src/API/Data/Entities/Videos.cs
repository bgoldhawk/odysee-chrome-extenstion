using System;

namespace API.Data.Entities
{
    public class Videos
    {
        public string VideoTitle { get; set; }
        public double WatchTime { get; set; }   
        public DateTime LastModified { get; set; }
    }
}
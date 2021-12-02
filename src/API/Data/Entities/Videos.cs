using System;

namespace API.Data.Entities
{
    public class Videos
    {

        public string ChannelName { get; set; }
        public string VideoName { get; set; }
        public double WatchTime { get; set; }   
        public DateTime LastModified { get; set; }
    }
}

using System;
using System.Collections.Generic;
using MongoDB.Bson.Serialization.Attributes;

namespace API.Data.Entities
{
    public class User
    {
        public User()
        {
            Id = Guid.NewGuid();
            WatchList = new List<Videos>();
            DateCreated = DateTime.UtcNow;
        }

        [BsonId]
        public Guid Id { get; set; }

        public List<Videos> WatchList { get; set; }

        public DateTime DateCreated { get; set; }
        public DateTime? LastModifed { get; set; }

    }
}
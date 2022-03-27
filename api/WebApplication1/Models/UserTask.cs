using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApplication1.Models
{
    public class UserTask
    {
        public int UserId { get; set; }
        public int TaskId { get; set; }
        public string CreationDate { get; set; }
        public string ExpirationDate { get; set; }
        public bool Finished { get; set; }
    }
}

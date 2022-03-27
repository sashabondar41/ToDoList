using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Data;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using WebApplication1.Models;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserTaskController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _env;
        public UserTaskController(IConfiguration configuration, IWebHostEnvironment env)
        {
            _configuration = configuration;
            _env = env;
        }


        [HttpGet("{id}")]
        public JsonResult Get(int id)
        {
            string query = @"
                            select dbo.Tasks.TaskId, dbo.Tasks.TaskName, dbo.Tasks.TaskDescription, convert(varchar(10),dbo.UserTask.ExpirationDate,120) as ExpirationDate, dbo.UserTask.Finished
                            from
                            dbo.UserTask
                            inner join dbo.Tasks ON dbo.Tasks.TaskId  = dbo.UserTask.TaskId
                            where dbo.UserTask.UserId = @UserId
                            ";

            DataTable table = new DataTable();
            string sqlDataSource = _configuration.GetConnectionString("ToDoAppCon");
            SqlDataReader myReader;
            using (SqlConnection myCon = new SqlConnection(sqlDataSource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@UserId", id);
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }

            return new JsonResult(table);
        }

        [HttpPost]
        public JsonResult Post(UserTask utsk)
        {
            string query = @"
                           insert into dbo.UserTask
                           (UserId,TaskId, CreationDate, ExpirationDate, Finished)
                    values (@UserId, @TaskId, getdate(), convert(datetime,@ExpirationDate,120), 0)
                            ";

            DataTable table = new DataTable();
            string sqlDataSource = _configuration.GetConnectionString("ToDoAppCon");
            SqlDataReader myReader;
            using (SqlConnection myCon = new SqlConnection(sqlDataSource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@UserId", utsk.UserId);
                    myCommand.Parameters.AddWithValue("@TaskId", utsk.TaskId);
                    myCommand.Parameters.AddWithValue("@ExpirationDate", utsk.ExpirationDate);
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }

            return new JsonResult("Added Successfully");
        }


        [HttpPut]
        public JsonResult Put(UserTask utsk)
        {
            string query = @"
                           update dbo.UserTask
                           set ExpirationDate= convert(datetime,@ExpirationDate,120),
                           Finished=@Finished
                           where TaskId=@TaskId and UserId=@UserId
                            ";

            DataTable table = new DataTable();
            string sqlDataSource = _configuration.GetConnectionString("ToDoAppCon");
            SqlDataReader myReader;
            using (SqlConnection myCon = new SqlConnection(sqlDataSource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@UserId", utsk.UserId);
                    myCommand.Parameters.AddWithValue("@TaskId", utsk.TaskId);
                    myCommand.Parameters.AddWithValue("@ExpirationDate", utsk.ExpirationDate);
                    myCommand.Parameters.AddWithValue("@Finished", utsk.Finished);
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }

            return new JsonResult("Updated Successfully");
        }


        [HttpDelete]
        public JsonResult Delete(UserTask utsk)
        {
            string query = @"
                           delete from dbo.UserTask
                            where TaskId=@TaskId and UserId=@UserId
                            ";

            DataTable table = new DataTable();
            string sqlDataSource = _configuration.GetConnectionString("ToDoAppCon");
            SqlDataReader myReader;
            using (SqlConnection myCon = new SqlConnection(sqlDataSource))
            {
                myCon.Open();
                using (SqlCommand myCommand = new SqlCommand(query, myCon))
                {
                    myCommand.Parameters.AddWithValue("@TaskId", utsk.TaskId);
                    myCommand.Parameters.AddWithValue("@UserId", utsk.UserId);
                    myReader = myCommand.ExecuteReader();
                    table.Load(myReader);
                    myReader.Close();
                    myCon.Close();
                }
            }

            return new JsonResult("Deleted Successfully");
        }
    }
}

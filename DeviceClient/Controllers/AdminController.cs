using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KVM.entity;
using KVM.LiteDB.DAL.Admin;
using KVM.LiteDB.DAL.Project;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DeviceClient.Controllers
{
    [Route("api/[controller]")]
    public class AdminController : Controller
    {
        private IAdmin _col;
        public IProject _projectCol;
        private string rootPath;
        public AdminController([FromServices]IHostingEnvironment env, IAdmin col, IProject pCol)
        {
            _col = col;
            _projectCol = pCol;
            rootPath = env.WebRootPath;
        }
        // GET: /<controller>/
        [HttpGet]
        public IActionResult Index()
        {
            return Json(_col.GetAll().Count());
        }

        [HttpPost("new")]
        public IActionResult New(Admin admin)
        {
            admin.Id = Guid.NewGuid().ToString();
            return Json(_col.Insert(admin));
        }

        [HttpPost("login")]
        public IActionResult Login(Admin admin)
        {
            return Json(_col.Login(admin));
        }
        [HttpPost("user/login/{id}")]
        public IActionResult UserLogin(LoginData data, string id)
        {
            return Json(_projectCol.UserLogin(data, id));
        }
    }
}

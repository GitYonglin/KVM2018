using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KVM.LiteDB.DAL.Record;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DeviceClient.Controllers.Record
{
    [Route("api/[controller]")]
    public class RecordController : Controller
    {
        public IRecord _col;
        private string rootPath;
        public RecordController([FromServices]IHostingEnvironment env, IRecord col)
        {
            _col = col;
            rootPath = env.WebRootPath;
        }
        // GET: /<controller>/
        public IActionResult Index()
        {
            return View();
        }
        [HttpGet("{id}")]
        public JsonResult One(string id)
        {
            return Json(_col.GetOne(id));
        }

        [HttpPost]
        public IActionResult Post([FromBody]KVM.entity.Record data)
        {
            //var r = JsonConvert.DeserializeObject<KVM.entity.Record>(data.Id);
            return Json(_col.Insert(data));
        }
    }
}

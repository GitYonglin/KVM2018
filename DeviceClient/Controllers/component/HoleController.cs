using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KVM.entity;
using KVM.LiteDB.DAL.Component.Hole;
using DeviceClient.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DeviceClient.Controllers.component
{
    [Route("api/[controller]")]
    public class HoleController : Controller
    {
        public IHole _col;
        private string rootPath;
        public HoleController([FromServices]IHostingEnvironment env, IHole col)
        {
            rootPath = env.WebRootPath;
            _col = col;
        }
        // GET: /<controller>/
        public IActionResult Index()
        {
            return Json(_col.GetAll());
        }

        [HttpPost]
        public IActionResult Post(Hole data)
        {
            data.Id = Guid.NewGuid().ToString();
            data.ImgUrl = FileOperation.FileImg(data.ImgFile, data.Id, rootPath, Path(data.ParentId));
            return Json(_col.Insert(data));
        }

        [HttpPut]
        public IActionResult Put(Hole data)
        {
            data.ImgUrl = FileOperation.FileImg(data.ImgFile, data.Id, rootPath, Path(data.ParentId));
            return Json(_col.UpData(data));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(string id)
        {
            var delete = _col.GetOne(id);
            FileOperation.DeleteFile(rootPath, delete.ImgUrl);
            return Json(_col.Delete(delete));
        }

        private string Path(string path)
        {
            return $@"data/component/hole/{path}";
        }
    }
}

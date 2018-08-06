using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KVM.entity;
using KVM.LiteDB.DAL.Task.HoleGroup;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DeviceClient.Controllers.Task
{
  [Route("api/[controller]")]
  public class HoleGroupController : Controller
  {
    public IHoleGroup _col;
    private string rootPath;
    public HoleGroupController([FromServices]IHostingEnvironment env, IHoleGroup col)
    {
      _col = col;
      rootPath = env.WebRootPath;
    }

    // GET: /<controller>/
    public IActionResult Index()
    {
      return Json(_col.GetAll());
    }
    [HttpGet("{id}")]
    public IActionResult Index(string id)
    {
      return Json(_col.GetOne(id));
    }

    [HttpPost]
    public IActionResult Post(HoleGroup data)
    {
      data.Id = Guid.NewGuid().ToString();
      return Json(_col.Insert(data));
    }

    [HttpPut("{id}")]
    public IActionResult Put(string id, HoleGroup data)
    {
      return Json(_col.UpData(id, data));
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
      var delete = _col.GetOne(id);
      return Json(_col.Delete(delete));
    }

    private string Path(string path)
    {
      return $@"data/project/operator/{path}";
    }
  }
}

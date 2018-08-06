using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KVM.entity;
using KVM.LiteDB.DAL.Task;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DeviceClient.Controllers.Task
{
  [Route("api/[controller]")]
  public class TaskController : Controller
  {
    public ITask _col;
    private string rootPath;
    public TaskController([FromServices]IHostingEnvironment env, ITask col)
    {
      _col = col;
      rootPath = env.WebRootPath;
    }

    // GET: /<controller>/
    //public IActionResult Index()
    //{
    //  return Json(_col.MenuData());
    //}
    [HttpGet("menu/{projectId}")]
    public IActionResult Index(string projectId)
    {
      return Json(_col.MenuData(projectId));
    }

    [HttpGet("menu/bridges/{projectId}/{componentId}")]
    public IActionResult Index(string projectId, string componentId)
    {
      return Json(_col.MenuData(projectId, componentId));
    }

    [HttpGet("{id}")]
    public JsonResult One(string id)
    {
      return Json(_col.GetOne(id));
    }


    [HttpPost("copy")]
    public IActionResult CopyTask(CopyTask data)
    {
      return Json(_col.CopyInsert(data));
    }

    [HttpPost]
    public IActionResult Post(KVM.entity.Task data)
    {
      return Json(_col.Insert(data));
    }

    [HttpPut("{id}")]
    public IActionResult Put(string id, KVM.entity.Task data)
    {
      return Json(_col.UpData(id, data));
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
      //FileOperation.DeleteDir($@"{rootPath}/data/project/operator/{id}");
      return Json(_col.Delete(id));
    }
  }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KVM.entity;
using KVM.LiteDB.DAL.Component;
using KVM.LiteDB.DAL.Component.Hole;
using DeviceClient.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DeviceClient.Controllers.component
{
  [Route("api/[controller]")]
  public class ComponentController : Controller
  {
    public IComponent _col;
    private string rootPath;
    public ComponentController([FromServices]IHostingEnvironment env, IComponent col)
    {
      _col = col;
      rootPath = env.WebRootPath;
    }

    // GET: /<controller>/
    public IActionResult Index()
    {
      return Json(_col.MenuData());
    }

    [HttpGet("{id}")]
    public JsonResult One(string id)
    {
      return Json(_col.GetOne(id));
    }


    [HttpPost]
    public IActionResult Post(Component data)
    {
      data.Id = Guid.NewGuid().ToString();
      return Json(_col.Insert(data));
    }

    [HttpPut("{id}")]
    public IActionResult Put(string id, Component data)
    {
      return Json(_col.UpData(id, data));
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
      FileOperation.DeleteDir($@"{rootPath}/data/component/hole/{id}");
      return Json(_col.Delete(id));
    }
  }
}

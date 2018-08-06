using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using KVM.LiteDB.DAL.Device;
using DeviceClient.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace DeviceClient.Controllers.Device
{
  [Route("api/[controller]")]
  public class DeviceController : Controller
  {
    public IDevice _col;
    private string rootPath;
    public DeviceController([FromServices]IHostingEnvironment env, IDevice col)
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
    public IActionResult Post(KVM.entity.Device data)
    {
      data.Id = Guid.NewGuid().ToString();
      return Json(_col.Insert(data));
    }

    [HttpPut("{id}")]
    public IActionResult Put(string id, KVM.entity.Device data)
    {
      return Json(_col.UpData(id, data));
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
      FileOperation.DeleteDir($@"{rootPath}/data/project/operator/{id}");
      return Json(_col.Delete(id));
    }
  }
}

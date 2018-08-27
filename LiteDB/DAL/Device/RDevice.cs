using KVM.entity;
using LiteDB;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace KVM.LiteDB.DAL.Device
{
    public class RDevice : RBase<entity.Device>, IDevice
    {
        private LiteCollection<entity.Device> _col;
        public RDevice(IOptions<DbString> dbString) : base(dbString)
        {
            _col = DbCollection<entity.Device>();
        }
        /// <summary>
        /// 添加一条数据
        /// </summary>
        /// <param name="data">数据</param>
        /// <returns></returns>
        public new ReturnPost Insert(entity.Device data)
        {
            if (_col.FindOne(p => p.sName == data.sName) == null)
            {
                _col.Insert(data);
                return new ReturnPost() { Data = data, Message = true };
            }
            return new ReturnPost() { Message = false };
        }
        /// <summary>
        /// 修改一条数据
        /// </summary>
        /// <param name="id">Id</param>
        /// <param name="data">数据</param>
        /// <returns></returns>
        public new ReturnPost UpData(string id, entity.Device data)
        {
            var searchData = _col.Find(p => p.sName == data.sName);
            if (searchData.Count() == 0 || (searchData.Count() == 1 && searchData.Select(s => s.Id == id).Count() == 1))
            {
                var old = _col.FindById(id);
                var updata = Class2Class.C2C(old, data);
                if (_col.Update(updata))
                {
                    return new ReturnPost() { Data = updata, Message = true };
                }
            }
            return new ReturnPost() { Message = false };
        }
        /// <summary>
        /// 获取一条数据
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns></returns>
        public new entity.Device GetOne(string id)
        {
            var Device = _col.FindById(new BsonValue(id));
            return Device;
        }

        /// <summary>
        /// 获取菜单显示数据
        /// </summary>
        /// <returns></returns>
        public new IEnumerable<MenuData> MenuData()
        {
            var obj = _col.FindAll();
            List<MenuData> menuData = new List<MenuData>();
            foreach (var item in obj)
            {
                menuData.Add(new MenuData { Id = item.Id, Name = item.sName });
            }
            return menuData;
        }

        /// <summary>
        /// 删除一条数据
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns></returns>
        public new string Delete(string id)
        {
            _col.Delete(id);
            return "";
        }
    }
}

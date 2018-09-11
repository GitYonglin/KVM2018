using KVM.entity;
using LiteDB;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace KVM.LiteDB.DAL.Task
{
    public class RTask : RBase<entity.Task>, ITask
    {
        private LiteCollection<entity.Task> _col;
        private LiteCollection<entity.HoleGroup> _holeGroup;
        private LiteCollection<entity.Device> _Device;
        private LiteCollection<entity.Record> _record;
        private LiteCollection<entity.Component> _component;
        private LiteCollection<entity.Hole> _hole;
        private LiteCollection<entity.SteelStrand> _steelStrand;
        public RTask(IOptions<DbString> dbString) : base(dbString)
        {
            _col = DbCollection<entity.Task>();
            _holeGroup = DbCollection<entity.HoleGroup>();
            _Device = DbCollection<entity.Device>();
            _record = DbCollection<entity.Record>();
            _component = DbCollection<entity.Component>();
            _hole = DbCollection<entity.Hole>();
            _steelStrand = DbCollection<SteelStrand>();
        }
        /// <summary>
        /// 添加一条数据
        /// </summary>
        /// <param name="data">数据</param>
        /// <returns></returns>
        public new ReturnPost Insert(entity.Task data)
        {
            if (_col.FindOne(p => p.ComponentId == data.ComponentId && p.BridgeName == data.BridgeName && p.ProjectId == data.ProjectId) == null)
            {
                data.Id = Guid.NewGuid().ToString();
                _col.Insert(data);
                foreach (var item in data.HoleGroups)
                {
                    item.Id = Guid.NewGuid().ToString();
                    item.ParentId = data.Id;
                    _holeGroup.Insert(item);
                }
                return new ReturnPost() { Data = data, Message = true };
            }
            return new ReturnPost() { Message = false };
        }
        /// <summary>
        /// 复制
        /// </summary>
        /// <param name="data">数据</param>
        /// <returns></returns>
        public ReturnPost CopyInsert(CopyTask data)
        {
            try
            {
                if (_col.FindOne(p => p.ProjectId == data.ProjectId && p.ComponentId == data.ComponentId && p.BridgeName == data.BridgeName) == null)
                {
                    var copyData = _col.FindOne(p => p.Id == data.Id);
                    if (copyData != null)
                    {
                        copyData.Id = Guid.NewGuid().ToString();
                        copyData.BridgeName = data.BridgeName;
                        _col.Insert(copyData);
                        var holeGroups = _holeGroup.Find(h => h.ParentId == data.Id);
                        foreach (var item in holeGroups)
                        {
                            item.Id = Guid.NewGuid().ToString();
                            item.ParentId = copyData.Id;
                            _holeGroup.Insert(item);
                        }
                        return new ReturnPost() { Data = copyData, Message = true };
                    }
                }
                return new ReturnPost() { Message = false };
            }
            catch (Exception)
            {
                return new ReturnPost() { Message = false };
            }
        }
        /// <summary>
        /// 修改一条数据
        /// </summary>
        /// <param name="data">数据</param>
        /// <returns></returns>
        public ReturnPost UpData(entity.Task data)
        {
            var searchData = _col.Find(p => p.ComponentId == data.ComponentId && p.BridgeName == data.BridgeName && p.ProjectId == data.ProjectId);
            if (searchData.Count() == 0 || (searchData.Count() == 1 && searchData.Select(s => s.Id == data.Id).Count() == 1))
            {
                var old = _col.FindById(data.Id);
                //var updata = Class2Class.C2C(old, data);
                if (_col.Update(data))
                {
                    return new ReturnPost() { Data = data, Message = true };
                }
            }
            return new ReturnPost() { Message = false };
        }
        /// <summary>
        /// 获取一条数据
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns></returns>
        public new entity.Task GetOne(string id)
        {
            var Task = _col.FindById(new BsonValue(id));
            Task.Component = _component.FindById(new BsonValue(Task.ComponentId));
            Task.Hole = _hole.FindById(Task.HoleId);
            Task.SteelStrand = _steelStrand.FindById(new BsonValue(Task.SteelStrandId));
            Task.HoleGroupsRadio = _holeGroup.Find(o => o.ParentId == id).Select(h => new HoleGroupsRadio
            { Hole = h.Name, Id = h.Id, State = GetRecordState(h.Id) }
            );
            Task.Device = _Device.FindById(Task.DeviceId);
            return Task;
        }
        /// <summary>
        /// 获取一条数据
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns></returns>
        public entity.Task GetOneData(string id)
        {
            var Task = _col.FindById(new BsonValue(id));
            Task.HoleGroups = _holeGroup.Find(o => o.ParentId == id);
            Task.Device = _Device.FindById(Task.DeviceId);
            return Task;
        }
        private int GetRecordState(string id)
        {
            var r = _record.FindOne(re => re.Id == id);
            return r != null ? r.State : 0;
        }
        /// <summary>
        /// 获取菜单显示数据
        /// </summary>
        /// <returns></returns>
        public IEnumerable<TaskMenu> MenuData(string projectId)
        {
            return _col.Find(t => t.ProjectId == projectId)
              .GroupBy(p => (p.ComponentId),
                (key, holeGroup) => new TaskMenu { Name = _component.FindById(key).sName, Id = key, Count = holeGroup.Count() });
        }

        /// <summary>
        /// 删除一条数据
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns></returns>
        public new string Delete(string id)
        {
            _col.Delete(id);
            _holeGroup.Delete(o => o.ParentId == id);
            return "";
        }

        public IEnumerable<MenuData> MenuData(string projectId, string componentId)
        {
            return _col.Find(t => t.ProjectId == projectId && t.ComponentId == componentId).Select(x =>
                new MenuData { Name = x.BridgeName, Id = x.Id, State = GetBriderState(x.Id) }
            );
        }
        private int GetBriderState(string id)
        {
            var task = _holeGroup.Find(h => h.ParentId == id);
            var records = _record.Find(r => r.ParentId == id);
            if (records != null)
            {
                int state = 0;
                int state1 = 0;
                foreach (var item in records)
                {
                    if (item != null)
                    {
                        if (item.State == 3)
                        {
                            return 3;
                        }
                        if (item.State == 2)
                        {
                            return 2;
                        }
                        if (item.State == 1)
                        {
                            state = 1;
                        }
                    }
                }
                if (task.Count() != records.Count())
                {
                    state1 = 4;
                }
                if (state1 == 4 && state == 1)
                {
                    return 4;
                }
                return state;
            }
            return 0;
        }
    }
}

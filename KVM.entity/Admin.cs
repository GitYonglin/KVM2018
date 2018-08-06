using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.entity
{
    public class Admin
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }
        public IEnumerable<Obj> Objs { get; set; }
    }
    public class Obj
    {
        public string Id { get; set; }
        public string ProjecName{ get; set; }
    }
    public class LoginData
    {
        public string Name { get; set; }
        public string Password { get; set; }
    }
}

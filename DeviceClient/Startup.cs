using DeviceClient.Hubs;
using KVM.LiteDB;
using KVM.LiteDB.DAL.Admin;
using KVM.LiteDB.DAL.Component;
using KVM.LiteDB.DAL.Component.Hole;
using KVM.LiteDB.DAL.Device;
using KVM.LiteDB.DAL.Project;
using KVM.LiteDB.DAL.Project.Operator;
using KVM.LiteDB.DAL.Project.SteelStrand;
using KVM.LiteDB.DAL.Project.Supervision;
using KVM.LiteDB.DAL.Record;
using KVM.LiteDB.DAL.Task;
using KVM.LiteDB.DAL.Task.HoleGroup;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DeviceClient
{
    public class Startup
    {
        private string _rootPath;
        public Startup(IConfiguration configuration, [FromServices]IHostingEnvironment env)
        {
            Configuration = configuration;
            _rootPath = env.WebRootPath;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/dist";
            });

            services.Configure<DbString>(options =>
            {
                //DbSetting skillArray = JsonMapper.ToObject<DbSetting>(File.ReadAllText($@"{rootPath}\test.txt"));//使用这种方法，泛型类的字段，属性必须为public，而且字段名，顺序必须与json文件中对应
                options.ConnectionString = $@"{_rootPath}\data\{Configuration.GetSection("LiteDB:ConnectionString").Value}";
            });
            services.AddScoped<IAdmin, RAdmin>();
            services.AddScoped<IProject, RProject>();
            services.AddScoped<IOperator, ROperator>();
            services.AddScoped<ISupervision, RSupervision>();
            services.AddScoped<ISteelStrand, RSteelStrand>();
            services.AddScoped<IComponent, RComponent>();
            services.AddScoped<IHole, RHole>();
            services.AddScoped<IDevice, RDevice>();
            services.AddScoped<ITask, RTask>();
            services.AddScoped<IHoleGroup, RHoleGroup>();
            services.AddScoped<IRecord, RRecord>();

            services.AddSignalR();

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }

            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseSignalR(s => s.MapHub<PLCHub>("/PLC"));

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501

                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    spa.UseAngularCliServer(npmScript: "start");
                }
            });
        }
    }
}

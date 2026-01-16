FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5002

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["PackageManager.Api/PackageManager.Api.csproj", "./"]
RUN dotnet restore "PackageManager.Api.csproj"
COPY PackageManager.Api/ .
RUN dotnet build "PackageManager.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PackageManager.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_URLS=http://+:5002
ENTRYPOINT ["dotnet", "PackageManager.Api.dll"]

r"""
    This code was generated by
   ___ _ _ _ _ _    _ ____    ____ ____ _    ____ ____ _  _ ____ ____ ____ ___ __   __
    |  | | | | |    | |  | __ |  | |__| | __ | __ |___ |\ | |___ |__/ |__|  | |  | |__/
    |  |_|_| | |___ | |__|    |__| |  | |    |__] |___ | \| |___ |  \ |  |  | |__| |  \

    Twilio - Bulkexports
    This is the public Twilio REST API.

    NOTE: This class is auto generated by OpenAPI Generator.
    https://openapi-generator.tech
    Do not edit the class manually.
"""


from typing import Any, Dict, Optional
from twilio.base.instance_context import InstanceContext
from twilio.base.instance_resource import InstanceResource
from twilio.base.list_resource import ListResource
from twilio.base.version import Version

from twilio.rest.bulkexports.v1.export.day import DayList
from twilio.rest.bulkexports.v1.export.export_custom_job import ExportCustomJobList
from twilio.rest.bulkexports.v1.export.job import JobList


class ExportInstance(InstanceResource):

    """
    :ivar resource_type: The type of communication – Messages, Calls, Conferences, and Participants
    :ivar url: The URL of this resource.
    :ivar links: Contains a dictionary of URL links to nested resources of this Export.
    """

    def __init__(
        self,
        version: Version,
        payload: Dict[str, Any],
        resource_type: Optional[str] = None,
    ):
        super().__init__(version)

        self.resource_type: Optional[str] = payload.get("resource_type")
        self.url: Optional[str] = payload.get("url")
        self.links: Optional[Dict[str, object]] = payload.get("links")

        self._solution = {
            "resource_type": resource_type or self.resource_type,
        }
        self._context: Optional[ExportContext] = None

    @property
    def _proxy(self) -> "ExportContext":
        """
        Generate an instance context for the instance, the context is capable of
        performing various actions. All instance actions are proxied to the context

        :returns: ExportContext for this ExportInstance
        """
        if self._context is None:
            self._context = ExportContext(
                self._version,
                resource_type=self._solution["resource_type"],
            )
        return self._context

    def fetch(self) -> "ExportInstance":
        """
        Fetch the ExportInstance


        :returns: The fetched ExportInstance
        """
        return self._proxy.fetch()

    async def fetch_async(self) -> "ExportInstance":
        """
        Asynchronous coroutine to fetch the ExportInstance


        :returns: The fetched ExportInstance
        """
        return await self._proxy.fetch_async()

    @property
    def days(self) -> DayList:
        """
        Access the days
        """
        return self._proxy.days

    @property
    def export_custom_jobs(self) -> ExportCustomJobList:
        """
        Access the export_custom_jobs
        """
        return self._proxy.export_custom_jobs

    def __repr__(self) -> str:
        """
        Provide a friendly representation

        :returns: Machine friendly representation
        """
        context = " ".join("{}={}".format(k, v) for k, v in self._solution.items())
        return "<Twilio.Bulkexports.V1.ExportInstance {}>".format(context)


class ExportContext(InstanceContext):
    def __init__(self, version: Version, resource_type: str):
        """
        Initialize the ExportContext

        :param version: Version that contains the resource
        :param resource_type: The type of communication – Messages, Calls, Conferences, and Participants
        """
        super().__init__(version)

        # Path Solution
        self._solution = {
            "resource_type": resource_type,
        }
        self._uri = "/Exports/{resource_type}".format(**self._solution)

        self._days: Optional[DayList] = None
        self._export_custom_jobs: Optional[ExportCustomJobList] = None

    def fetch(self) -> ExportInstance:
        """
        Fetch the ExportInstance


        :returns: The fetched ExportInstance
        """

        payload = self._version.fetch(
            method="GET",
            uri=self._uri,
        )

        return ExportInstance(
            self._version,
            payload,
            resource_type=self._solution["resource_type"],
        )

    async def fetch_async(self) -> ExportInstance:
        """
        Asynchronous coroutine to fetch the ExportInstance


        :returns: The fetched ExportInstance
        """

        payload = await self._version.fetch_async(
            method="GET",
            uri=self._uri,
        )

        return ExportInstance(
            self._version,
            payload,
            resource_type=self._solution["resource_type"],
        )

    @property
    def days(self) -> DayList:
        """
        Access the days
        """
        if self._days is None:
            self._days = DayList(
                self._version,
                self._solution["resource_type"],
            )
        return self._days

    @property
    def export_custom_jobs(self) -> ExportCustomJobList:
        """
        Access the export_custom_jobs
        """
        if self._export_custom_jobs is None:
            self._export_custom_jobs = ExportCustomJobList(
                self._version,
                self._solution["resource_type"],
            )
        return self._export_custom_jobs

    def __repr__(self) -> str:
        """
        Provide a friendly representation

        :returns: Machine friendly representation
        """
        context = " ".join("{}={}".format(k, v) for k, v in self._solution.items())
        return "<Twilio.Bulkexports.V1.ExportContext {}>".format(context)


class ExportList(ListResource):
    def __init__(self, version: Version):
        """
        Initialize the ExportList

        :param version: Version that contains the resource

        """
        super().__init__(version)

        self._uri = "/Exports"

        self._jobs: Optional[JobList] = None

    @property
    def jobs(self) -> JobList:
        """
        Access the jobs
        """
        if self._jobs is None:
            self._jobs = JobList(self._version)
        return self._jobs

    def get(self, resource_type: str) -> ExportContext:
        """
        Constructs a ExportContext

        :param resource_type: The type of communication – Messages, Calls, Conferences, and Participants
        """
        return ExportContext(self._version, resource_type=resource_type)

    def __call__(self, resource_type: str) -> ExportContext:
        """
        Constructs a ExportContext

        :param resource_type: The type of communication – Messages, Calls, Conferences, and Participants
        """
        return ExportContext(self._version, resource_type=resource_type)

    def __repr__(self) -> str:
        """
        Provide a friendly representation

        :returns: Machine friendly representation
        """
        return "<Twilio.Bulkexports.V1.ExportList>"
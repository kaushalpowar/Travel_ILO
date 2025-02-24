def print_response(response):
    #file_names = [metadata["file_name"] for metadata in response.metadata.values()]
    file_names = [node.metadata.get("file_name") for node in response.source_nodes if "file_name" in node.metadata]
    unique_file_names = list(set(file_names))
    #print(f"Source: \n {unique_file_names}")
    return unique_file_names